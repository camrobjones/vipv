# ---------------- #
# - Participants - #
# ---------------- #

preprocess.ppts <- function(ppts, studyName=F, from=F, til=F) {
  
  ppts <- ppts %>%
    
    # Remove incomplete runs
    filter(end_time != "") %>%
    
    # Cast start & end to datetime
    mutate(
      start_time = as.POSIXct(start_time),
      end_time = as.POSIXct(end_time),
      
      # Calculate runtime
      runtime = difftime(end_time, start_time, units=c("mins")),
      
      # Calculate age
      age = as.integer(format(Sys.Date(), "%Y")) - birth_year,
      
      # Modify columns
      id = as.factor(id),
      participant_id = id, # Easier joins
      ppt_id = id, # More concise
      excluded = 0  # Init excluded column
      
    )
  
  if (studyName != F) {
    # Filter on date range
    ppts <- ppts %>% filter(
      study == studyName
    )
  }
  
  # Filter on date range
  if (from != F) {
    
    ppts <- ppts %>%
      filter(
        start_time > as.POSIXct(from)
      )
  }
  
  if (til != F) {
    
    ppts <- ppts %>%
      filter(
        start_time < as.POSIXct(til)
      )
  }
  
  return (ppts)
}

exclude.ppts <- function(ppts, native.eng=T, vision=T, max.runtime=F) {
  
  ppts$excluded = F
  
  # Native eng
  if (native.eng) {
    ppts <- ppts %>%
      mutate(
        ex.native_eng = native_english != "True",
        excluded = excluded | ex.native_eng
      )
  }
  
  # Vision
  if (vision) {
    ppts <- ppts %>%
      mutate(
        ex.vision = (vision != "yes") & (!excluded),
        excluded = excluded | ex.vision
      )
  }
  
  # Runtime
  if (max.runtime) {
    ppts <- ppts %>%
      mutate(
        ex.runtime = (runtime > max.runtime) & (!excluded),
        excluded = excluded | ex.runtime
      )
  }
  
  return(ppts)
}

# Attention Check trials

exclude.ppts.attention <- function(ppts, trials, answers, task, attention.cutoff) {
  
  # Create colname for accuracy exclusion
  taskname <- quo_name(task)
  colname.accuracy <- paste0(taskname, ".attention.accuracy")
  colname.ex <- paste0("ex.", taskname, ".attention")
  
  attention.accuracy <- trials %>%
    
    # Get attention trials
    filter(item_type=="attention") %>%
    select(participant_id, item_id, response) %>%
    # Merge correct answers
    merge(answers) %>%
    # Mark as (in)correct
    mutate(
      correct = response == correct_response
    ) %>%
    # Find by-ppt accuracy
    group_by(participant_id) %>%
    summarize(
      !!colname.accuracy := mean(correct),
      .groups="drop"
    )
  
  ppts <- ppts %>%
    merge(attention.accuracy) %>%
    mutate(
      !!colname.ex := (!!as.name(colname.accuracy) < attention.cutoff) & (!excluded),
      excluded := (excluded | !!as.name(colname.ex) )
    )
  
  return(ppts)
}

# Exclude based on accuracy
exclude.ppts.accuracy <- function(ppts, trials, task, accuracy.cutoff) {
  
  # Create colname for accuracy exclusion
  taskname <- quo_name(task)
  colname.accuracy <- paste0(taskname, ".accuracy")
  colname.ex <- paste0("ex.", taskname, ".accuracy")
  
  task.accuracy <- trials %>%
    
    # Get attention trials
    select(participant_id, accuracy) %>%
    group_by(participant_id) %>%
    summarize(
      !!colname.accuracy := mean(accuracy),
      .groups="drop"
    )
  
  ppts <- ppts %>%
    merge(task.accuracy) %>%
    mutate(
      !!colname.ex := (!!as.name(colname.accuracy) < accuracy.cutoff) & (!excluded),
      excluded := (excluded | !!as.name(colname.ex) )
    )
  
  return(ppts)
}

# ---------- #
# - Trials - #
# ---------- #


exclude.relative.by.ppt <- function(df, column, nsd) {
  
  # Init excluded column if not there
  if (!("excluded" %in% colnames(df))) {
    df$excluded = FALSE
  }
  
  column <- enquo(column)
  colname <- quo_name(column)
  colname.lo <- paste0("ex.", colname, ".rel.lo")
  colname.hi <- paste0("ex.", colname, ".rel.hi")
  
  df <- df %>%
    group_by(participant_id) %>%
    mutate(
      col_mean := mean(!!as.name(colname)),
      col_sd := sd(!!as.name(colname)),
      !!colname.lo := (!!as.name(colname) < (col_mean - (nsd * col_sd)) & (!excluded)),
      !!colname.hi := (!!as.name(colname) > (col_mean + (nsd * col_sd)) & (!excluded)),
      excluded = ((excluded | !!as.name(colname.lo)) | !!as.name(colname.hi))
    ) %>%
    select(-col_mean, -col_sd) %>%
    ungroup()
  
  return(df)
}


exclude.absolute.by.ppt <- function(df, column, minval, maxval) {
  
  # Init excluded column if not there
  if (!("excluded" %in% colnames(df))) {
    df$excluded = FALSE
  }
  
  column <- enquo(column)
  colname <- quo_name(column)
  colname.lo <- paste0("ex.", colname, ".abs.lo")
  colname.hi <- paste0("ex.", colname, ".abs.hi")
  
  df <- df %>%
    group_by(participant_id) %>%
    mutate(
      !!colname.lo := (!!as.name(colname) < minval) & (!excluded),
      !!colname.hi := (!!as.name(colname) > maxval) & (!excluded),
      excluded = ((excluded | !!as.name(colname.lo)) | !!as.name(colname.hi))
    ) %>%
    ungroup()
  
  return(df)
}

exclude.ppt.ex.trials <- function(ppts, trials,
                                  thresh.removed.trials, colname="ex.trials.excluded") {
  
  ppts.excluded = trials %>%
    group_by(participant_id) %>%
    summarize(excluded = sum(excluded),
              excluded_prop = excluded / n(),
              .groups="drop") %>%
    filter(excluded_prop > thresh.removed.trials)
  
  ppts <- ppts %>%
    mutate(
      !!colname := (participant_id %in% ppts.excluded$participant_id) & (!excluded),
      excluded = excluded | (!!as.name(colname))
    )
  
  trials <- trials %>%
    mutate(
      ex.ppt.excluded = (participant_id %in% ppts.excluded$participant_id) & (!excluded),
      excluded = excluded | (ex.ppt.excluded)
    )
  
  return(list(ppts=ppts, trials=trials))
}

# ----------- #
# - Summary - #
# ----------- #

summarise.exclusions <- function(df) {
  summary.df <- df %>%
    select(starts_with("ex.")) %>%
    summarise(
      across(.fns=sum)
    )
  
  retained = nrow(df %>% filter(excluded==FALSE))
  reason = colnames(summary.df)
  removed = as.numeric(summary.df[1,])
  reason <- c(reason, "------", "Total Removed", "Retained")
  removed <- c(removed, NA, sum(removed), retained)
  removed.proportional <- round(removed / nrow(df), 3) * 100
  
  summary <- data.frame(reason, removed, removed.proportional)
  colnames(summary) <- c("Reason", "Removed", "(%)")
  return(summary)
}


# ---------- #
# - Models - #
# ---------- #


summarise.lrts <- function(lrt, a, b) {
  
  dfs <- as.numeric(lapply(lrt, function(x) {x$Df[2]}))
  chi2 <- as.numeric(lapply(lrt, function(x) {x$Chisq[2]}))
  p <- as.numeric(lapply(lrt, function(x) {x$`Pr(>Chisq)`[2]}))
  
  lrt.summary <- data.frame(a, b, dfs, chi2, p)
  colnames(lrt.summary) <- c("Model A", "Model B", "Df", "Chi^2", "p")
  return(lrt.summary)
  
}


get_r2 <- function(m) {
  suppressWarnings(r.squaredGLMM(m)[1])
}

summarise.models <- function(models, names) {
  AICs <- sapply(models, AIC)
  r2s <- sapply(models, get_r2)
  
  models.summary <- data.frame(names, AICs, r2s)
  colnames(models.summary) <- c("Predictors", "AIC", "marginal r2")
  models.summary
}
